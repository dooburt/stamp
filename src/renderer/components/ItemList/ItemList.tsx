import Item from './Item';

function ItemList() {
  return (
    <ul className="w-full">
      <Item title="Sims Stuff" path="[..]/The Sims 4/Mods" />
      <Item
        title="Bank Details"
        path="[..]/Documents/Bank Details.docx"
        color="lime"
      />
      <Item
        title="Image Stash"
        path="[..]/Documents/Bank Details.docx"
        color="indigo"
      />
      <Item
        title="Photos"
        path="[..]/Documents/Bank Details.docx"
        color="emerald"
      />
      <Item
        title="Photos Of Dogs"
        path="[..]/Documents/Bank Details.docx"
        color="rose"
      />
    </ul>
  );
}

export default ItemList;
