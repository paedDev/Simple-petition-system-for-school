import React from "react";
import { Link } from "react-router-dom";
import image1 from "../assets/uc-logo.jpg";
import image2 from "../assets/BackgroundFinal.jpg";
import image3 from "../assets/78.jpg";
import image4 from "../assets/BG-image.jpg";
const Home = () => {
  return (
    <div className="home">
      <div className="nav">
        <div className="navbar">
          <div className="">
            <img
              src={image1}
              alt=""
              style={{ width: "300px", marginRight: "20px", height: "80px" }}
            />
          </div>
          <div className="btn-login">
            <Link to={"/login"}>
              <h1>Login</h1>
            </Link>
          </div>
        </div>
      </div>
      <div className="content">
        <div className="left">
          <h1>Welcome to University of the Cordilleras</h1>
        </div>
        <div className=""></div>
      </div>
    </div>
  );
};

export default Home;
