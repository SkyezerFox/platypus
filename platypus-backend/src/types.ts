import { RequestHandler } from "express";
import { PlatypusServer } from "./server";

export type Partional<T> = Partial<T> | undefined;
export type Awaitable<T> = T | Promise<T>;

export type SRH = (server: PlatypusServer) => RequestHandler;
