/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/function-component-definition */
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { SpinnerCircular } from 'spinners-react';
import Button from '../Button/Button';

type ConfirmRemovalModalProps = {
  open: boolean;
  onClose: () => void;
  // onComplete: () => void;
};

const ConfirmRemovalModal: React.FC<ConfirmRemovalModalProps> = ({
  open,
  onClose,
  // onComplete,
}) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEsc = (event: any) => {
      if (event.keyCode === 27 && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose, loading]);

  const renderLoading = () => {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <SpinnerCircular size="64" color="#eef2ff" secondaryColor="#4f46e5" />
        <span className="text-indigo-800 text-3xl animate-pulse block">
          Just a moment...
        </span>
      </div>
    );
  };

  const renderCancelLabel = () => {
    return <span className="text-white pl-1">No</span>;
  };

  const renderDeleteLabel = () => {
    return (
      <>
        <FontAwesomeIcon icon={faTrash} className="text-white" />{' '}
        <span className="text-white pl-1">Yes</span>
      </>
    );
  };

  const renderClose = () => {
    return (
      <div className="absolute top-4 right-4">
        <button type="button" onClick={onClose}>
          <FontAwesomeIcon icon={faXmark} className="text-slate-600 text-lg" />
        </button>
      </div>
    );
  };

  const renderModalContent = () => {
    return (
      <div className="bg-white px-4 pt-2 pb-4">
        <div>
          <div className="w-full pb-4">
            <p className="text-slate-800 p-2 mb-4 mt-2 rounded text-sm">
              Peekaboo does not delete your data. Continuing will decrypt the
              data and move it to its original location and remove this listing
              from Peekaboo. Do you wish to continue?
            </p>

            {/* <div className="mb-4">
              <label
                htmlFor="friendlyName"
                className="block text-sm font-medium text-gray-700"
              >
                Set a friendly name
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="text"
                  name="friendlyName"
                  id="friendlyName"
                  className="block w-full rounded-md border-2 p-2 border-indigo-500 focus:border-indigo-500 focus:ring-indigo-600 outline-indigo-700 h-12"
                  placeholder="My secure files"
                />
              </div>
            </div> */}
            <Button
              label={renderCancelLabel()}
              classes={[
                'h-12',
                'w-full',
                'bg-slate-400',
                'hover:bg-indigo-700',
                'disabled:bg-gray-200',
                'disabled:text-gray-500',
                'mb-2',
              ]}
              handleClick={() => console.log('cobblers')}
            />
            <Button
              label={renderDeleteLabel()}
              classes={[
                'h-12',
                'w-full',
                'bg-emerald-500',
                'hover:bg-indigo-700',
                'disabled:bg-gray-200',
                'disabled:text-gray-500',
              ]}
              handleClick={() => console.log('cobblers')}
            />
          </div>
        </div>
      </div>
    );
  };

  return open ? null : (
    <>
      <div className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-80 transition-opacity">
        &nbsp;
      </div>
      <div className="fixed flex inset-0 z-10 overflow-y-auto justify-center items-center">
        {/* <div className="flex items-end justify-center p-4 text-center">
          &nbsp;
        </div> */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-slate-100 p-4 border border-b-slate-200 relative">
            <h3
              className="text-lg font-medium leading-6 text-gray-900"
              id="modal-title"
            >
              Are you sure?
            </h3>
            {loading ? null : renderClose()}
          </div>
          {loading ? renderLoading() : renderModalContent()}
        </div>
      </div>
    </>
  );
};

export default ConfirmRemovalModal;
