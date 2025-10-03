"use client";

import React from "react";
import { Box, IconButton, TextField } from "@mui/material";
import { IoSend } from "react-icons/io5";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import "@/styles/client/chat.css";

const schema = z.object({
  query: z.string().min(1, "Vui lòng nhập câu hỏi"),
});
type QueryType = z.infer<typeof schema>;

export function InputBox() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<QueryType>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: QueryType) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations`,
        { role: "user", content: values.query },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Response from server:", res.data);
      reset();
    } catch (error) {
      console.error("Error posting to server:", error);
    }
  };

  return (
    <Box sx={{ mt: 5 }} className="chat-box">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="chat-form">
        {/* Phần trên: ô để nhập câu hỏi */}
        <TextField
          {...register("query")}
          placeholder="Nhập tin nhắn..."
          variant="outlined"
          multiline
          maxRows={10}
          error={!!errors.query}
          helperText={errors.query?.message}
          className="chat-input"
        />

        {/* Phần dưới: nút gửi */}
        <Box className="chat-actions">
          <IconButton
            className="chat-send"
            type="submit"
            disabled={isSubmitting}
          >
            <IoSend />
          </IconButton>
        </Box>
      </form>
    </Box>
  );
}