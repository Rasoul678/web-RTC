import React, { useContext, useEffect, useRef } from "react";
import { SocketContext } from "../../SocketContext";
import { Typography, Paper, Grid } from "@material-ui/core";
import { useStyles } from "./useVideoPlayerStyles";

interface IProps {}

const VideoPlayer: React.FC<IProps> = (props) => {
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);

  const classes = useStyles();

  const { name, call, stream, callAccepted, callEnded, myStream, userStream } =
    useContext(SocketContext);

  useEffect(() => {
    if (myVideoRef.current) {
      myVideoRef.current.srcObject = myStream as MediaProvider;
    }
  }, [myStream]);

  useEffect(() => {
    if (userVideoRef.current) {
      userVideoRef.current.srcObject = userStream as MediaProvider;
    }
  }, [userStream]);

  return (
    <Grid container className={classes.gridContainer}>
      {stream && (
        <Paper className={classes.paper}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {name || "Name"}
            </Typography>
            <video
              playsInline
              muted
              ref={myVideoRef}
              autoPlay
              className={classes.video}
            />
          </Grid>
        </Paper>
      )}
      {callAccepted && !callEnded && (
        <Paper className={classes.paper}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {call?.callerName || "Name"}
            </Typography>
            <video
              playsInline
              ref={userVideoRef}
              autoPlay
              className={classes.video}
            />
          </Grid>
        </Paper>
      )}
    </Grid>
  );
};

export default VideoPlayer;
