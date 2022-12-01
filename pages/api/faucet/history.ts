// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next";

const LocalStorage = require("node-localstorage").LocalStorage;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
		res
			.status(405)
			.send({ code: -1, message: "Only GET requests allowed" } as any);
		return;
	}
	const localStorage = new LocalStorage("./scratch");
	const localRecords = await localStorage.getItem("records");
	const records = JSON.parse(localRecords as any) || [];

  const reqBody = req.body;
  const page = req.body.page || 1;
  const pageSize = 5;
  const result = records.slice(Number((page - 1) * pageSize),Number(page * pageSize));
  const list = result.map((item: { address: any; time: any; })=>{
    return {
      address:item.address,
      createTime:item.time
    }
  })
	res.status(200).json({
    code:0,
    data:list,
    totalPage: Math.ceil(records.length / pageSize)
  });
};

export default handler;
