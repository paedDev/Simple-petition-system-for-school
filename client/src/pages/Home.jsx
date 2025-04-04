import React from "react";
import { Link } from "react-router-dom";
import image1 from "../assets/uc-logo.jpg";
import image2 from "../assets/BackgroundFinal.jpg";
import image3 from "../assets/78.jpg";
import image4 from "../assets/BG-image.jpg";
import image5 from "../assets/infrontOfUc.jpg";
import image6 from "../assets/icpep.jpg";
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
          <div className="">
            <Link to={"/about"} style={{ textDecoration: "none" }}>
              <h3 className="about-btn">About Us</h3>
            </Link>
          </div>
        </div>
      </div>
      <div className="content">
        <div className="left">
          <h1>Welcome to the University of the Cordilleras Petition System</h1>

          <div className="content-links">
            <Link to={"/login"}>
              <button className="btn-login">Click to Login</button>
            </Link>
            <Link to={"/signup"}>
              <button className="btn">Click to Sign Up</button>
            </Link>
          </div>
        </div>
        <div className="right" style={{ flex: "1" }}>
          <img src={image5} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Home;
