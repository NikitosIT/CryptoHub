import { cryptotokens } from "./cryptotokens.service.js";
import type {
  CryptotokensRequest,
  CryptotokensResponse,
} from "./cryptotokens.types.js";

export const cryptotokensController = async (
  _req: CryptotokensRequest,
  res: CryptotokensResponse,
) => {
  const data = await cryptotokens.list();
  res.json(data);
};
