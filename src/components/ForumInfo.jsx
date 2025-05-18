import React from 'react';

function ForumInfo({ subTitle, header }) {
  return (
    <div className="px-4 pt-3 pb-2">
      <h2 className="text-lg font-semibold text-gray-800">{subTitle}</h2>
      {header && <p className="text-sm text-gray-600 mt-0.5">{header}</p>}
      <hr className="mt-2 mb-0 border-gray-200" />
    </div>
  );
}

export default ForumInfo;