
const express = require("express");
const { check, validationResult} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth")
const User = require("../models/User");
const ShortUrl = require("../models/ShortUrl");

var fs = require('fs');
var path = require('path');
const { log } = require("console");
/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */

router.post(
    "/signup",
    [
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 6
        })
    ],
    async (req, res) => {
        console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            email,
            password
        } = req.body;
        try {
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    msg: "User Already Exists"
                });
            }

            user = new User({
                email,
                password
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                "randomString", {
                    expiresIn: 10000
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        token
                    });
                }
            );
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);

router.post(
    "/login",
    [
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
        min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
        }

        const { email, password } = req.body;
        try {
        let user = await User.findOne({
            email
        });
        if (!user)
            return res.status(400).json({
            message: "User Not Exist"
            });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({
            message: "Incorrect Password !"
            });

        const payload = {
            user: {
            id: user.id
            }
        };

        jwt.sign(
            payload,
            "randomString",
            {
            expiresIn: 3600
            },
            (err, token) => {
            if (err) throw err;
            res.status(200).json({
                token
            });
            }
        );
        } catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Server Error"
        });
        }
    }
);

router.get("/me", auth, async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
});  

router.post("/short", auth, async (req, res) => {
    try {
        // request.user is getting fetched from Middleware after token authentication
        const {fullUrl} = req.body;
        const su = await ShortUrl.create({full: fullUrl, userId: req.user.id})
        var user = await User.findById(req.user.id);
        user.urls.push(su);
        user = await User.findByIdAndUpdate(req.user.id, {urls: user.urls});
        res.json({short: su, user: user});
      } catch (e) {
        console.log(e);
        res.send({ message: e });
      }
})
router.post("/delete", auth, async (req, res) => {
    try {
        // request.user is getting fetched from Middleware after token authentication
        const {short} = req.body;
        console.log(short);
        await ShortUrl.findByIdAndRemove(short._id);
        var user = await User.findById(req.user.id);
        var ind = user.urls.findIndex(u => u._id == short._id);
        console.log(ind);
        user.urls.splice(ind, 1);
        user = await User.findByIdAndUpdate(req.user.id, {urls: user.urls});
        res.json({user});
      } catch (e) {
        console.log(e);
        res.send({ message: e });
      }
})
router.get("/:short", async (req, res) => {
    const url = await ShortUrl.findOne({short: req.params.short});
    url.clicks+=1;
    console.log(url.clicks);
    // var user = await User.findById(url.userId);
    // console.log(url._id);
    // var ind = user.urls.findIndex(u => u._id == url._id);
    // console.log(ind);
    // user.urls[ind].clicks = url.clicks;
    // await User.findByIdAndUpdate(url.userId, {urls: user.urls});
    await ShortUrl.findByIdAndUpdate(url._id, {clicks: url.clicks});
    res.json({url: url.full});
})
module.exports = router;
