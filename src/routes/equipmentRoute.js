import express from "express";
const router = express.Router();

// controllers
import { getAllEquipment, addEquipment, deleteEquipment, updateEquipment } from "../controllers/home/equipment.js";

// middleware
import authentication from "../middlewares/authentication.js";
import uploadImage from "../middlewares/UploadImage.js";
router.use(authentication);

router.get("/", getAllEquipment);
router.post("/", uploadImage, addEquipment);
router.put("/", uploadImage, updateEquipment);
router.delete("/:id", deleteEquipment);

export default router;
