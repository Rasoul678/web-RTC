import React, { useContext } from "react";
import { Button } from "@material-ui/core";
import { SocketContext } from "../../SocketContext";
import { useStyles } from "./useNotofocationsStyles";

interface IProps {}

const Notifications: React.FC<IProps> = (props) => {
  const { answerCall, call, callAccepted } = useContext(SocketContext);
  const classes = useStyles();

  return (
    <>
      {call?.isReceivingCall && !callAccepted && (
        <div className={classes.acceptCall}>
          <h1>{call.callerName} is calling: </h1>
          <Button
            variant="contained"
            color="primary"
            onClick={answerCall}
          >Answer</Button>
        </div>
      )}
    </>
  );
};

export default Notifications;
