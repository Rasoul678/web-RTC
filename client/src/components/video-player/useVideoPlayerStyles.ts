import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  video: {
    width: "500px",
    [theme.breakpoints.down("xs")]: {
      width: "300px",
    },
  },
  gridContainer: {
    justifyContent: "center",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
  paper: {
    padding: "10x",
    border: "2px solid #000",
    margin: "10px",
  },
}));
