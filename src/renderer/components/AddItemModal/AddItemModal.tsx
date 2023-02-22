/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/function-component-definition */
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { SpinnerCircular } from 'spinners-react';
import folder from '../../assets/icons/folder.png';
import file from '../../assets/icons/file.png';
import files from '../../assets/icons/documents.png';

type AddItemModalProps = {
  open: boolean;
  onClose: () => void;
};

const AddItemModal: React.FC<AddItemModalProps> = ({ open, onClose }) => {
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

  const handleFolderSelect = async () => {
    const dir = await window.electron.selectDir();
    if (dir.canceled) return null;

    setLoading(true);

    await window.electron.encryptDir(dir.filePaths[0]);
    await window.electron.readPeekabooContents();

    setLoading(false);
    onClose();
    return null;
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
            <p className="text-yellow-600 bg-yellow-100 p-2 mb-4 mt-2 rounded text-sm">
              <span className="font-bold">Beware!</span> On making a selection,
              Peekaboo will immediately encrypt and move your selection from its
              location. The contents of your selection{' '}
              <span className="pr-1 text-yellow-700 underline">will only</span>{' '}
              be retrievable via Peekaboo and your master password.
            </p>

            <div className="mb-4">
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
            </div>

            <button
              type="button"
              className="inline-flex hover:bg-indigo-200 w-full mb-1 bg-slate-100 text-slate-800 rounded-md px-4 py-2 text-base font-medium"
              onClick={handleFolderSelect}
            >
              <img src={folder} alt="Folder" width="32px" className="mr-2" />{' '}
              <span className="inline-block pt-1">
                A folder of files and folders
              </span>
            </button>
            <button
              type="button"
              className="inline-flex hover:bg-indigo-200 w-full mb-1 bg-slate-100 text-slate-800 rounded-md px-4 py-2 text-base font-medium"
            >
              <img src={file} alt="File" width="32px" className="mr-2" />{' '}
              <span className="inline-block pt-1">A single file</span>
            </button>
            <button
              type="button"
              className="inline-flex hover:bg-indigo-200 w-full mb-1 bg-slate-100 text-slate-800 rounded-md px-4 py-2 text-base font-medium"
            >
              <img src={files} alt="File" width="32px" className="mr-2" />{' '}
              <span className="inline-block pt-1">
                A selection of loose files
              </span>
            </button>
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
              What would you like to add to Peekaboo?
            </h3>
            {loading ? null : renderClose()}
          </div>
          {loading ? renderLoading() : renderModalContent()}
        </div>
      </div>
    </>
  );
};

export default AddItemModal;
