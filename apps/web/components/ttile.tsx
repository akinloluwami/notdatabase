"use client";
import { useEffect } from "react";

export default (props: any) => {
  useEffect(() => {
    if (Array.isArray(props.children)) {
      document.title = props.children.join("");
    } else {
      document.title = props.children || "";
    }
  }, [props.children]);
  return <></>;
};
