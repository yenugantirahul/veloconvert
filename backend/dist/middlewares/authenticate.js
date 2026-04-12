// import type { NextFunction, Request, Response } from "express";
// import { fromNodeHeaders } from "better-auth/node";
// import { auth } from "../lib/auth.ts";
export {};
// export type AuthenticatedRequest = Request & {
// 	user?: Record<string, unknown>;
// };
// export const authMiddleware = async (
// 	req: AuthenticatedRequest,
// 	res: Response,
// 	next: NextFunction
// ) => {
// 	try {
// 		const session = await auth.api.getSession({
// 			headers: fromNodeHeaders(req.headers),
// 		});
// 		if (!session || !session.user) {
// 			return res.status(401).json({ message: "Unauthorized" });
// 		}
// 		req.user = session.user as Record<string, unknown>;
// 		return next();
// 	} catch {
// 		return res.status(401).json({ message: "Invalid session" });
// 	}
// };
// export default authMiddleware;
