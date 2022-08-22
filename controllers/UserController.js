import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import userModel from '../models/User.js';


export const register = async (req, res) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const doc = new userModel({
            email: req.body.email,
            passwordHash,
        });

        const user = await doc.save();

        const token = jwt.sign({
            _id: user._id,
        },
        'secret',
        {
            expiresIn: '30m',
        },
        );

        res.json({
            _id: user._id,
            token: token,
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const login = async (req, res) => {
    try {
        const user = await userModel.findOne({email: req.body.email});

        if (!user) {
            return res.status(400).json({
                message: "Неверный логин или пароль",
            });
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
        if (!isValidPass) {
            return res.status(400).json({
                message: "Неверный логин или пароль",
            });
        }

        const token = jwt.sign({
            _id: user._id,
        },
        'secret',
        {
            expiresIn: '30m',
        },
        );
        res.json({
            _id: user._id,
            token: token,
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const whoami = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        if (!user) {
           return res.status(404).json({
               message: 'Пользователь не найден',
           }); 
        }
        const {passwordHash, ...userData} = user._doc;

        res.json({
            ...userData,
        });
    } catch (err) {
        res.status(500).json(err);
    }
};
