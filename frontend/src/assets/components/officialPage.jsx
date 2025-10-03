import { useEffect, useState } from "react";
import { LogOut, Clock, Link as LinkIcon, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
const OfficialPage = () => {
  const blockaddress = "localhost";
  const blockport = "9000";
  const [cids, setCids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [textContents, setTextContents] = useState({});
  
  
  const getcidsfromblock = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://${blockaddress}:${blockport}/getcids`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      
      setCids(data?.cids || []);
    } catch (err) {
      console.error("Error fetching CIDs:", err);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  useEffect(() => {
    getcidsfromblock();
  }, []);

  const fetchText = async (cid) => {
    try {
      const res = await fetch(`https://ipfs.io/ipfs/${cid}`);
      const text = await res.text();
      setTextContents((prev) => ({ ...prev, [cid]: text }));
    } catch (err) {
      console.error("Error fetching text:", err);
    }
  };

  const handleLogout = async () => {
    // Add your logout logic here
    console.log("in logout")
    console.log("Logging out...");
    localStorage.clear(); 
    console.log(`http://${blockaddress}:${blockport}/logout`)
    const res=await fetch(`http://${blockaddress}:${blockport}/logout`,{
      "method":"POST",
      "credentials":"include", 
      "headers":{
        "Content-Type":"application/json"
      }
    });
    if (!res) throw new Error(`HTTP error! Status: ${res.status}`);
    const data = await res.json();
    console.log(data);
    if (data.msg === 'Logged out successfully') {
      navigate('/auth');
    }else{
      alert("Something went wrong")
    }
    // Example: redirect or clear auth tokens
    // window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Official Page
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all duration-200 border border-slate-700 hover:border-slate-600"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              </div>
              <p className="text-slate-400 text-lg mt-6 font-medium">Loading content...</p>
            </div>
          </div>
        ) : cids.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cids.map((item, index) => {
              const gatewayUrl = `https://ipfs.io/ipfs/${item.cid}`;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-slate-700/50 hover:border-slate-600/50 group"
                >
                  {/* Content Display */}
                  <div className="mb-5 overflow-hidden rounded-xl bg-slate-950/50 border border-slate-800">
                    {!textContents[item.cid] ? (
                      <img
                        src={gatewayUrl}
                        alt={item.note || "IPFS content"}
                        className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                        onError={() => {
                          if (!textContents[item.cid]) fetchText(item.cid);
                        }}
                      />
                    ) : (
                      <pre className="bg-black text-green-400 p-5 overflow-x-auto text-sm font-mono whitespace-pre-wrap break-words max-h-96 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                        {textContents[item.cid]}
                      </pre>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="space-y-3">
                    {/* CID */}
                    <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                      <LinkIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                          Content ID
                        </p>
                        <a
                          href={gatewayUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-mono text-xs break-all transition-colors underline decoration-blue-400/30 hover:decoration-blue-300"
                        >
                          {item.cid}
                        </a>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                      <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">
                          Timestamp
                        </p>
                        <span className="text-slate-300 text-sm">
                          {new Date(Number(item.timestamp) * 1000).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Note */}
                    {item.note && (
                      <div className="p-4 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-lg border border-slate-700/50">
                        <p className="text-slate-300 text-sm italic leading-relaxed">
                          "{item.note}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/50 rounded-full mb-6 border border-slate-700">
              <FileText className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No Content Found</h3>
            <p className="text-slate-500">There are no CIDs available to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficialPage;