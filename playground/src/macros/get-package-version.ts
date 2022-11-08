import { safeJSONParse } from "pastable";
import packageJson from "../../../lib/package.json";

const getPackageJsonVersion = () => ({ data: packageJson.version });
export default getPackageJsonVersion;
