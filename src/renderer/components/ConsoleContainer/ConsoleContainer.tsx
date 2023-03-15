import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../Navigation/Navigation';
import Button from '../Button/Button';

function ConsoleContainer() {
  const navigate = useNavigate();
  const [output, setOutput] = useState(['Welcome to Peekaboo']);

  useEffect(() => {
    const getConsoleOutput = async () => {
      const data = await window.electron.getConsole();
      setOutput(data);
    };

    getConsoleOutput();
  }, []);

  const handleConsoleClose = () => {
    console.log('close');
    navigate('/dashboard');
  };

  const renderConsoleCloseLabel = () => {
    return <span className="text-slate-800 pl-1">Close</span>;
  };

  return (
    <div className="grid grid-cols-12 h-screen w-full">
      {/* <SizedConfetti run={confetti} onCompleteConfetti={setConfetti(false)} /> */}
      <div className="flex col-span-3 justify-center bg-slate-800">
        <div className="pt-8 pb-4 px-4 flex flex-col w-full">
          <div className="basis-10/12">
            <Navigation />
          </div>
          <div className="w-full">
            <Button
              label={renderConsoleCloseLabel()}
              classes={[
                'mt-8',
                'h-12',
                'w-full',
                'bg-slate-300',
                'hover:bg-purple-700/60',
                'disabled:bg-gray-200',
                'disabled:text-gray-500',
              ]}
              handleClick={handleConsoleClose}
            />
          </div>
        </div>
      </div>
      <div className="flex col-span-9 w-full">
        <div className="w-full mt-7 bg-indigo-900">
          <textarea
            id="console"
            readOnly
            className="p-2 w-full text-white bg-indigo-900 font-mono h-full outline-none whitespace-pre-line"
            value={output.length > 0 ? output.join('\n') : output}
          />
        </div>
      </div>
    </div>
  );
}

export default ConsoleContainer;
