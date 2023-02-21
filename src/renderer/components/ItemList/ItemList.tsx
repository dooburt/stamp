import Item from './Item';

function ItemList() {
  return (
    <ul className="w-full">
      <Item title="Sims Stuff" initials="SS" path="[..]/The Sims 4/Mods" />
      <Item
        title="Bank Details"
        initials="BD"
        path="[..]/Documents/Bank Details.docx"
        color="indigo"
      />
      <li className="my-1 w-full hover:bg-slate-200 rounded-md">
        <div className="flex py-1">
          <div className="">
            <div className="flex w-10 h-10 bg-indigo-300 text-indigo-800 font-bold p-2 justify-center items-center m-2 rounded-lg">
              BP
            </div>
          </div>
          <div className="flex-grow">
            <span className="text-lg text-gray-800 block">Bank Passwords</span>
            <span className="text-sm text-gray-400 block truncate">
              [..]/Documents/Bank Stuff.docx
            </span>
          </div>
        </div>
      </li>
    </ul>
  );
}

export default ItemList;
