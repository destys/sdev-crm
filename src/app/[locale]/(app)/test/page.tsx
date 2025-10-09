import { getLocale } from "next-intl/server";
import React from "react";

const testpage = async () => {
  const locale = await getLocale();
  return <div>testpage - {locale}</div>;
};

export default testpage;
