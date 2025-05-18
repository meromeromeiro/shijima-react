import React from 'react';

function ForumInfo({ subTitle, header }) {
  return (
    <div className="px-4 pt-4 pb-2"> {/* uk-container-center equivalent with padding */}
      <h4 className="text-lg font-semibold text-gray-800">{subTitle}</h4>
      <div className="text-sm text-gray-600">{header}</div>
      <hr className="my-2 border-gray-300" />
    </div>
  );
}

export default ForumInfo;