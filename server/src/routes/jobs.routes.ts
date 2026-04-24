import express, {Request, Response} from "express"

const router = express.Router();

router.post("/create", async (req: Request, res: Response) => {
    console.log("Job created")
})

export default router