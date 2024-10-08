import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import Modal from "@mui/material/Modal";
import { Avatar } from "@mui/material";
import TextField from "@mui/material/TextField";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./EditProfile.css";
import { useTranslation } from "react-i18next";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  height: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 8,
};

function EditChild({ dob, setDob }) {
  const [open, setOpen] = React.useState(false);

  const { t } = useTranslation();

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <div className="birthdate-section" onClick={handleOpen}>
        <text>{t("profile.edit")}</text>
      </div>
      <Modal
        hideBackdrop
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 300, height: 300 }}>
          <div className="text">
            <h2>{t("profile.editDOB")}</h2>
            <p>
              {t("profile.para1")}
              <br />
              {t("profile.para2")} <br />
              {t("profile.para3")}{" "}
            </p>
            {/* <Button className='e-button'>Edit</Button> */}
            <input type="date" onChange={(e) => setDob(e.target.value)} />
            <Button
              className="e-button"
              onClick={() => {
                setOpen(false);
              }}
            >
              {t("profile.cancel")}
            </Button>
          </div>
        </Box>
      </Modal>
    </React.Fragment>
  );
}

export default function EditProfile({ user, loggedInUser }) {
  const [name, setName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [dob, setDob] = React.useState("");

  const { t } = useTranslation();

  const phoneNumber = user?.phoneNumber ? user.phoneNumber.replace("+", "") : null;

  const HandleSave = () => {
    try {
      const editedInfo = {
        name,
        bio,
        location,
        website,
        dob,
      };

      if (user.email) {
        fetch(`https://twitter-backend-main.onrender.com/userUpdates/?email=${user?.email}`, {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(editedInfo),
        })
          .then((res) => res.json())
          .then((data) => {
            // console.log("done", data);
            setOpen(false);
          });
        } else {
          // console.log("Phonee")
          fetch(`https://twitter-backend-main.onrender.com/userUpdates/?phoneNumber=${phoneNumber}`, {
            method: "PATCH",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify(editedInfo),
          })
          .then((res) => res.json())
          .then((data) => {
            // console.log("done", data);
            setOpen(false);
          });
        }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          setOpen(true);
        }}
        className="Edit-profile-btn"
      >
        {t("profile.editProfile")}
      </button>

      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="modal">
          <div className="header">
            <IconButton
              onClick={() => {
                setOpen(false);
              }}
            >
              <CloseIcon />
            </IconButton>
            <h2 className="header-title">{t("profile.editProfilee")}</h2>
            <button className="save-btn" onClick={HandleSave}>
              {t("profile.save")}
            </button>
          </div>
          <form className="fill-content">
            <TextField
              className="text-field"
              fullWidth
              label={t("profile.name")}
              id="fullWidth"
              variant="filled"
              onChange={(e) => setName(e.target.value)}
              defaultValue={loggedInUser[0]?.name ? loggedInUser[0].name : ""}
            />
            <TextField
              className="text-field"
              fullWidth
              label={t("profile.bio")}
              id="fullWidth"
              variant="filled"
              onChange={(e) => setBio(e.target.value)}
              defaultValue={loggedInUser[0]?.bio ? loggedInUser[0].bio : ""}
            />
            <TextField
              className="text-field"
              fullWidth
              label={t("profile.location")}
              id="fullWidth"
              variant="filled"
              onChange={(e) => setLocation(e.target.value)}
              defaultValue={
                loggedInUser[0]?.location ? loggedInUser[0].location : ""
              }
            />
            <TextField
              className="text-field"
              fullWidth
              label={t("profile.website")}
              id="fullWidth"
              variant="filled"
              onChange={(e) => setWebsite(e.target.value)}
              defaultValue={
                loggedInUser[0]?.website ? loggedInUser[0].website : ""
              }
            />
          </form>
          <div className="birthdate-section">
            <p>{t("profile.birthDate")}</p>
            <p>.</p>
            <EditChild dob={dob} setDob={setDob} />
          </div>
          <div className="last-section">
            {loggedInUser[0]?.dob ? (
              <h2>{loggedInUser[0].dob}</h2>
            ) : (
              <h2>{dob ? dob : <p>{t("profile.addYourDOB")}</p>}</h2>
            )}
            <div className="last-btn">
              <h2>{t("profile.switchProf")} </h2>
              <ChevronRightIcon />
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
