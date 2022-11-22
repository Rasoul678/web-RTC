import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import Peer, { SignalData } from "simple-peer";

const socket = io("http://localhost:5000");

interface IProps extends PropsWithChildren {}

type Stream = MediaStream | undefined;

interface Context {
  call?: ICall | null;
  callAccepted?: boolean;
  name?: string;
  setName?: React.Dispatch<React.SetStateAction<string>>;
  stream?: MediaStream;
  callEnded?: boolean;
  me?: string;
  myStream?: MediaStream;
  userStream?: MediaStream;
  callUser?: (id: string) => void;
  answerCall?: () => void;
  leaveCall?: () => void;
}

export const SocketContext = createContext<Context>({});

interface ICall {
  isReceivingCall: boolean;
  from: string;
  callerName: string;
  signal: string | SignalData;
}

const ContextProvider: React.FC<IProps> = ({ children }) => {
  const [stream, setStream] = useState<Stream>(undefined);
  const [myStream, setMyStream] = useState<Stream>(undefined);
  const [userStream, setUserStream] = useState<Stream>(undefined);
  const [me, setMe] = useState("");
  const [call, setCall] = useState<ICall | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const connectionRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        setMyStream(currentStream);
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
      setUserStream(currentStream);
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
      setUserStream(currentStream);
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
        name,
        setName,
        stream,
        callEnded,
        me,
        callUser,
        answerCall,
        leaveCall,
        myStream,
        userStream,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default ContextProvider;
