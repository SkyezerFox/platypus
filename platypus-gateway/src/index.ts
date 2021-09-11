import { config } from "dotenv";
import { PlatypusGateway } from "./gateway";
// load environment variables
config();
// create gateway server and listen
new PlatypusGateway().listen();
