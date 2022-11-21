import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import Peer, { SignalData } from "simple-peer";

export const SocketContext = createContext<{} | null>(null);

const socket = io("https://localhost:5000");

interface IProps extends PropsWithChildren {}

type Stream = MediaStream | undefined;

interface IVideoRef {
  srcObject: Stream;
}

interface ICall {
  isReceivingCall: boolean;
  from: string;
  callerName: string;
  signal: string | SignalData;
}

const ContextProvider: React.FC<IProps> = ({ children }) => {
  const [stream, setStream] = useState<Stream>(undefined);
  const [me, setMe] = useState("");
  const [call, setCall] = useState<ICall | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const myVideoRef = useRef<IVideoRef>({
    srcObject: undefined,
  });
  const userVideoRef = useRef<IVideoRef>({
    srcObject: undefined,
  });

  const connectionRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        myVideoRef.current!.srcObject = currentStream;
      });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("calluser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, callerName, signal });
    });
  }, []);

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (data) => {
      socket.emit("answercall", { signal: data, to: call!.from });
    });

    peer.on("stream", (currentStream) => {
      userVideoRef.current!.srcObject = currentStream;
    });

    peer.signal(call!.signal);
    connectionRef.current = peer;
  };

  const callUser = (id: string) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (data: SignalData) => {
      socket.emit("calluser", {
        userToCall: id,
        signalData: data,
        from: me,
        name,
      });
    });

    peer.on("stream", (currentStream) => {
      userVideoRef.current!.srcObject = currentStream;
    });

    socket.on("callaccepted", (signal) => {
      setCallAccepted(true);
      peer.signal = signal;
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current?.destroy();

    window.location.reload();
  };

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        myVideoRef,
        userVideoRef,
        name,
        setName,
        stream,
        callEnded,
        me,
        callUser,
        answerCall,
        leaveCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default ContextProvider;
