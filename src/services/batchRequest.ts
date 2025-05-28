// batchRequest.ts

/**
 * 定义一个接口，用于存储每个待处理的请求及其对应的 Promise resolve/reject 函数。
 */
interface BatchedRequest<T> {
    id: number;
    resolve: (value: T) => void;
    reject: (reason?: any) => void;
}

// 存储所有等待被批处理的请求
let pendingRequests: BatchedRequest<any>[] = [];
// 用于控制批处理的定时器ID
let timeoutId: ReturnType<typeof setTimeout> | null = null;
// 批处理的延迟时间 (毫秒)
const BATCH_DELAY_MS = 250;
// API 的基础 URL
let apiBaseUrl = '/api/v2/reactions'; // 默认值，可以通过 configureBatchGet 进行配置

/**
 * 配置批处理请求的 API 基础 URL。
 * @param baseUrl - API 的基础 URL。
 */
export function configureBatchGet(baseUrl: string): void {
    apiBaseUrl = baseUrl;
}

/**
 * 处理实际的批处理请求。
 * 它会收集所有 pendingRequests 中的 ID，发起一个单一的 fetch 请求，
 * 然后根据返回的数据解析并完成所有挂起的 Promise。
 */
async function processBatch(): Promise<void> {
    // 复制当前批处理请求的快照，以防在 fetch 期间有新的请求进来
    const currentBatch = [...pendingRequests];
    pendingRequests = []; // 清空待处理请求列表，为下一个批次做准备
    if (timeoutId) clearTimeout(timeoutId!); // 清除定时器，因为我们即将处理批次
    timeoutId = null; // 重置定时器ID

    // 提取所有不重复的 ID
    const idsToFetch = [...new Set(currentBatch.map(req => req.id))];

    if (idsToFetch.length === 0) {
        return; // 没有 ID 需要获取，直接返回
    }

    try {
        // 构建查询字符串：id=1,2,3,4...
        // 假设您的后端API期望这种格式来接收多个ID
        const query = idsToFetch.map(id => `id[]=${id}`).join('&');
        // 如果您的后端期望 id=1,2,3 这种单一参数，可以使用：
        // const query = `id=${idsToFetch.join(',')}`;

        const response = await fetch(`${apiBaseUrl}?${query}`); // 假设您的 API 端点是 /api/items

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json(); // 假设返回的数据是 { [id: string]: T } 或 T[]

        // 将返回的数据转换为一个方便查找的 Map
        // 假设 API 返回的是一个对象，其键是 ID，值是对应的数据
        // 例如：{ "1": { name: "Item A" }, "2": { name: "Item B" } }
        // 或者是一个数组，例如：[{ id: 1, name: "Item A" }, { id: 2, name: "Item B" }]
        const dataMap = new Map<string, any>();
        if (Array.isArray(data)) {
            data.forEach(item => {
                if (item && item.id !== undefined) {
                    dataMap.set(item.id.toString(), item);
                }
            });
        } else if (typeof data === 'object' && data !== null) {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    dataMap.set(key, data[key]);
                }
            }
        }


        // 遍历所有待处理的请求，根据 ID 分发数据
        currentBatch.forEach(req => {
            const item = dataMap.get(req.id.toString());
            if (item !== undefined) { // 检查是否找到了对应的数据 (可以是 null 但不能是 undefined)
                req.resolve(item);
            } else {
                req.reject(new Error(`Data for ID ${req.id} not found in batch response.`));
            }
        });

    } catch (error) {
        console.error("Batch fetch error:", error);
        // 如果批处理请求失败，拒绝所有当前批次中的 Promise
        currentBatch.forEach(req => {
            req.reject(error);
        });
    }
}

/**
 * 公共的 get 函数。
 * 当被调用时，它会将请求加入一个队列，并在一个短延迟后触发批处理。
 * @param id - 需要获取数据的 ID。
 * @returns 一个 Promise，当数据可用时会解决该 Promise。
 */
export function get<T = any>(id: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        pendingRequests.push({ id, resolve, reject });

        // 如果是当前批次的第一个请求，启动定时器
        if (pendingRequests.length === 1) {
            timeoutId = setTimeout(() => {
                processBatch();
            }, BATCH_DELAY_MS);
        }
    });
}

/**
 * 紧急取消所有挂起的批处理请求。
 * 主要用于组件卸载或全局清理。
 * @param reason - 取消的原因。
 */
export function cancelAllPendingBatchRequests(reason: string = 'Batch request cancelled'): void {
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
    const cancelledRequests = [...pendingRequests];
    pendingRequests = [];
    cancelledRequests.forEach(req => req.reject(new Error(reason)));
    console.warn(`Cancelled ${cancelledRequests.length} pending batch requests.`);
}

// 示例用法：
// import { get, configureBatchGet } from './batchRequest';

// // 在应用启动时配置 API 基础 URL (例如在 App.tsx 或 index.ts 中)
// configureBatchGet('https://api.yourdomain.com'); // 替换为你的实际 API 地址

// async function fetchData() {
//     console.log('Requesting item 1...');
//     const item1Promise = get<any>(1);

//     console.log('Requesting item 2...');
//     const item2Promise = get<any>(2);

//     // 假设在 250ms 内，所有这些请求都会被收集
//     setTimeout(() => {
//         console.log('Requesting item 3 (after 100ms)...');
//         get<any>(3).then(item => console.log('Fetched item 3:', item)).catch(err => console.error('Error fetching item 3:', err));
//     }, 100);

//     setTimeout(() => {
//         console.log('Requesting item 4 (after 300ms, should start a new batch)...');
//         get<any>(4).then(item => console.log('Fetched item 4:', item)).catch(err => console.error('Error fetching item 4:', err));
//     }, 300);

//     try {
//         const [item1, item2] = await Promise.all([item1Promise, item2Promise]);
//         console.log('Fetched item 1:', item1);
//         console.log('Fetched item 2:', item2);
//     } catch (error) {
//         console.error('Error in batch fetch:', error);
//     }
// }

// fetchData();

// // 如果你需要在某个组件卸载时取消未完成的请求，可以这样做：
// // import { useEffect } from 'react';
// // import { get, cancelAllPendingBatchRequests } from './batchRequest';
// //
// // function MyComponent() {
// //   useEffect(() => {
// //     get(5).then(data => console.log('Item 5:', data));
// //     get(6).then(data => console.log('Item 6:', data));
// //     return () => {
// //       // 当组件卸载时，取消所有挂起的批处理请求
// //       cancelAllPendingBatchRequests('Component unmounted');
// //     };
// //   }, []);
// //   return <div>My Component</div>;
// // }