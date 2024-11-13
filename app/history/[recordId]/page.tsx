import React from "react";

const page = async ({ params }: { params: { recordId: string } }) => {
  return <div>{params.recordId}</div>;
};

export default page;
