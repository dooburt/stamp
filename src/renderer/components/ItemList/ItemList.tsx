/* eslint-disable no-unused-vars */
/* eslint-disable react/function-component-definition */
import React from 'react';
import { PeekabooItem } from 'renderer/constants/app';
import Item from './Item';

type ItemListProps = {
  list: Array<PeekabooItem>;
  selectedItemId?: string | null;
  onSelectItem: (id: string) => void;
};

const ItemList: React.FC<ItemListProps> = ({
  list,
  onSelectItem,
  selectedItemId,
}) => {
  const renderNonIdealState = () => {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <p>So empty</p>
      </div>
    );
  };

  return (
    <ul className="w-full">
      {list.length === 0
        ? renderNonIdealState()
        : list.map((item: PeekabooItem, index: number) => {
            return (
              <Item
                key={item.id}
                id={item.id}
                title={item.friendlyName}
                path={item.originalLocation}
                color={item.color}
                onSelectItem={onSelectItem}
                selected={item.id === selectedItemId}
              />
            );
          })}
    </ul>
  );
};

ItemList.defaultProps = {
  selectedItemId: null,
};

export default ItemList;
