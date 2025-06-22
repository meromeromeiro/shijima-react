// import React, { Fragment } from 'react';

// const ModifyChildren = ({ children, modifier }) => {
//     console.log(modifier)
//     if (!modifier) {
//         return null;
//     }
//     const modifiedChildren = React.Children.map(children, child => {
//         return <ModifyChildren modifier={modifier}>{child}</ModifyChildren>
//     });
//     return (
//         <Fragment>
//             {modifiedChildren}
//         </Fragment>
//     );
// };

// export default ModifyChildren;