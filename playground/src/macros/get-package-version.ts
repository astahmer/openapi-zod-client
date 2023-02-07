import packageJson from "../../../lib/package.json";

const getPackageJsonVersion = () => ({ data: packageJson.version });

// eslint-disable-next-line import/no-unused-modules
export default getPackageJsonVersion;
