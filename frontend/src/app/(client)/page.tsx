"use client";

import React from "react";
import axios from "axios";
import "@/styles/client/main.css";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// ✅ Zod schema
const schema = z.object({
  query: z.string().min(1, "Vui lòng nhập câu hỏi!"),
});

type FieldType = z.infer<typeof schema>;

export default function Page() {
  // ✅ React Hook Form + Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FieldType>({
    resolver: zodResolver(schema),
  });

  // ✅ Submit handler
  const onSubmit = async (values: FieldType) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations`,
        {
          role: "user",
          content: values.query,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response from server:", res.data);
      reset(); // clear form sau khi submit thành công
    } catch (error) {
      console.error("Error posting to server:", error);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        margin: "50px auto",
        padding: 3,
        border: "1px solid #ddd",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Login Form
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          fullWidth
          label="Hỏi VietBook"
          {...register("query")}
          error={!!errors.query}
          helperText={errors.query?.message}
          margin="normal"
          variant="outlined"
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang gửi..." : "Gửi"}
        </Button>
      </form>
    </Box>
  );
}
