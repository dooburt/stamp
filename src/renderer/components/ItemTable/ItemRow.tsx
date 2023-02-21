function ItemRow() {
  return (
    <tr>
      <td className="px-4 py-4 text-sm font-medium whitespace-nowrap">
        <div>
          <h2 className="font-medium text-gray-800 dark:text-white ">
            orchard-lampshade-bulb
          </h2>
          {/* <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
            catalogapp.io
          </p> */}
        </div>
      </td>
      <td className="px-12 py-4 text-sm font-medium whitespace-nowrap">
        <div className="inline px-3 py-1 text-sm font-normal rounded-full text-emerald-500 gap-x-2 bg-emerald-100/60 dark:bg-gray-800">
          Locked
        </div>
      </td>
      <td className="px-4 py-4 text-sm whitespace-nowrap">
        <div>
          <h4 className="text-gray-700 dark:text-gray-200">
            C:/Users/dooburt/Documents/Private Papers.docx
          </h4>
          {/* <p className="text-gray-500 dark:text-gray-400">
            Brings all your news into one place
          </p> */}
        </div>
      </td>

      <td className="px-4 py-4 text-sm whitespace-nowrap">
        <span>196kb</span>
        {/* <div className="w-48 h-1.5 bg-blue-200 overflow-hidden rounded-full">
          <div className="bg-blue-500 w-2/3 h-1.5">&nbsp;</div>
        </div> */}
      </td>

      <td className="px-4 py-4 text-sm whitespace-nowrap">
        <button
          type="button"
          className="px-1 py-1 text-gray-500 transition-colors duration-200 rounded-lg dark:text-gray-300 hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
}

export default ItemRow;