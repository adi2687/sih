import { useState } from 'react';
import './main.css'
import uploadtoipfs from './Hooks/ipfs'
import { useEffect } from 'react';
export default function MessageClassifier() {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [containerTransform, setContainerTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)');

  // useEffect(()=>{
  //   uploadtoipfs(file)
  // },[file])
  const mladress = import.meta.VITE_ML_ADDRESS || "127.0.0.1"
  const mlport = import.meta.VITE_ML_PORT || 5000
  const handleTextSubmit = async () => {
    if (!message.trim()) return;

    setIsTextLoading(true);

    // Simulate API call
    try {
      const response = await fetch(`http://${mladress}:${mlport}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: message
      });
      const data = response.json()
      console.log(data)
      // Handle response here
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsTextLoading(false);
    }
  };
  // block chain 
  const blockchainipfsandmlresult = async (cid,note) => {
    const blockaddress = import.meta.VITE_ADDRESS || 'localhost'
    const blockport = import.meta.VITE_PORT || 9000
    const blockbackend = `http://${blockaddress}:${blockport}/insert`
    console.log(blockbackend, cid)
    const response = await fetch(blockbackend, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cid,note })
    })
    const data = await response.json()
    console.log(data)
  }


  const handletextipfs = async () => {
    const address = import.meta.VITE_ADDRESS || 'localhost'
    const port = import.meta.VITE_PORT || 8000
    const backend = `http://${address}:${port}/uploadtext`
    const respone = await fetch(backend, {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `message=${encodeURIComponent(message)}`
    })
    const data = await respone.json()
    console.log(data)
    if (data.status) {
      setMessage('')
      setIsTextLoading(false)
      setcid(data.cid)
      setcidlnk(data.url)
      handleAiPart(data.cid)

    }
  }
  // ml part 
  const handleAiPart = async (cid) => {
    if (!file && !message) return;
    console.log('in ml par',cid)
    setIsFileLoading(true);
    let name = ''
    if (file) {
      name = 'file'
    }
    else {
      name = 'message'
    }
    console.log('type: ', name)

    const mladress = import.meta.VITE_ML_ADDRESS || "192.168.137.189"
    const mlport = import.meta.VITE_ML_PORT || 5000
    let formData = new FormData();
    if (name === "message") {
      formData.append('message', message);
    } else if (name === 'file') {
      formData.append('file', file);
    }
    console.log(formData)
    try {
      const response = await fetch(`http://${mladress}:${mlport}/predict`, {
        method: 'POST',
        body: formData,
        name
      });
      const data = await response.json()
      console.log(data)
      const note = String(data.final_confidence) + " " + String(data.final_prediction);
      console.log('just before',cid,note)
      blockchainipfsandmlresult(cid,note) 

      if (data.status) {
        setFile(null)
        setIsFileLoading(false)
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsFileLoading(false);
    }
  };



  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const angleX = (y - centerY) / 30;
    const angleY = (centerX - x) / 30;

    setContainerTransform(`perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-5px)`);
  };

  const handleMouseLeave = () => {
    setContainerTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)');
  };
  const [cid, setcid] = useState(null)
  const [cidlink, setcidlnk] = useState("")
  // for media ipfs
  const uploadinipfs = async (file) => {
    const data = await uploadtoipfs(file)
    console.log(data)
    if (data.status) {
      setcid(data.cid)
      setcidlnk(data.url)
      handleAiPart(data.cid)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-x-hidden bg-gradient-to-br from-black to-gray-900 ml-50">
      {/* Animated background particles */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(2px 2px at 20px 30px, #fff, transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 90px 40px, #fff, transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.3), transparent),
            radial-gradient(2px 2px at 160px 30px, #fff, transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 100px',
          animation: 'sparkle 20s linear infinite'
        }}
      />

      <div
        className="relative bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-3xl p-12 max-w-lg w-11/12 overflow-hidden transition-transform duration-300 shadow-2xl"
        style={{
          transform: containerTransform,
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Shimmer effect */}
        <div
          className="absolute top-0 w-full h-full"
          style={{
            left: '-100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)',
            animation: 'shimmer 3s infinite'
          }}
        />

        <h2 className="text-center text-3xl font-light mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
          Message Classifier
        </h2>
        {/* Text Input Section */}
        <div className="mb-8">
          <div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              name='message'
              className="w-full p-4 mb-4 bg-gray-800 bg-opacity-80 border border-white border-opacity-10 rounded-xl text-white text-base transition-all duration-300 outline-none placeholder-gray-400 focus:border-opacity-30 focus:bg-gray-700 focus:bg-opacity-90 focus:shadow-lg focus:-translate-y-0.5"
            />
            <button
              onClick={() => {
                handletextipfs()
                // handleAiPart()
              }}
              disabled={isTextLoading || !message.trim()}
              className={`
                w-full p-4 bg-gradient-to-br from-gray-700 to-gray-800 border border-white border-opacity-20 rounded-xl text-white text-base font-medium cursor-pointer transition-all duration-300 outline-none uppercase tracking-wide relative overflow-hidden
                ${isTextLoading || !message.trim() ? 'opacity-70 pointer-events-none' : 'hover:from-gray-600 hover:to-gray-700 hover:border-opacity-40 hover:-translate-y-0.5 hover:shadow-xl'}
              `}
            >
              {isTextLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                'Analyze Text'
              )}
              <div className="absolute top-0 w-full h-full bg-gradient-to-r from-transparent via-white via-transparent to-transparent opacity-10 transform -translate-x-full hover:translate-x-full transition-transform duration-500"></div>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center my-8 opacity-30">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
          <span className="px-4 text-sm uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
        </div>

        {/* File Upload Section */}
        <div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              name='file'
              className="w-full p-4 mb-4 bg-gray-800 bg-opacity-80 border-2 border-dashed border-white border-opacity-20 rounded-xl text-white text-base transition-all duration-300 outline-none cursor-pointer hover:border-opacity-40 hover:bg-gray-700 hover:bg-opacity-90"
            />
            <button
              onClick={() => {
                uploadinipfs(file)
                // handleAiPart()
              }}
              disabled={isFileLoading || !file}
              className={`
                w-full p-4 bg-gradient-to-br from-gray-700 to-gray-800 border border-white border-opacity-20 rounded-xl text-white text-base font-medium cursor-pointer transition-all duration-300 outline-none uppercase tracking-wide relative overflow-hidden
                ${isFileLoading || !file ? 'opacity-70 pointer-events-none' : 'hover:from-gray-600 hover:to-gray-700 hover:border-opacity-40 hover:-translate-y-0.5 hover:shadow-xl'}
              `}
            >
              {isFileLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                'Upload & Analyze'
              )}
              <div className="absolute top-0 w-full h-full bg-gradient-to-r from-transparent via-white via-transparent to-transparent opacity-10 transform -translate-x-full hover:translate-x-full transition-transform duration-500"></div>
            </button>
            {cidlink ? (
              <div>
                <a href={cidlink}>File link</a>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sparkle {
          from { transform: translateY(0px); }
          to { transform: translateY(-100px); }
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        @media (max-width: 480px) {
          .container {
            padding: 2rem;
            margin: 1rem;
          }
          
          h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}