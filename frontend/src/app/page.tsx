"use client";

import { Form, Input, Button } from "antd";
import { FormProps } from "antd";
import React from "react";
import axios from "axios";
import "@/styles/client/main.css";

type FieldType = {
  query: string;
};

export default function Page() {
  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat`, values, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response from FastAPI:", res.data);
    } catch (error) {
      console.error("Error posting to FastAPI:", error);
    }
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2 style={{ textAlign: "center" }}>Login Form</h2>
      <Form
        name="basic"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        style={{ maxWidth: 400 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          name="query"
          rules={[{ required: true, message: "Vui lòng nhập câu hỏi!" }]}
        >
          <Input placeholder="Hỏi VietBook" className="form-item" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
          <Button type="primary" htmlType="submit">
            Gửi
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
