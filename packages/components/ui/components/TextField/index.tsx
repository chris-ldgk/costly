"use client";
// @subframe/sync-disable
import React from "react";
import { TextField as TextFieldBase } from "./TextField";
import type { InputProps } from "./TextField";
import * as SubframeUtils from "../../utils";

/** Original Input — capture before Object.assign replaces TextFieldBase.Input. */
const BaseInput = TextFieldBase.Input;

/**
 * TextField wrapper — 16px input text prevents iOS Safari focus zoom.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <BaseInput
      ref={ref}
      className={SubframeUtils.twClassNames("text-base", className)}
      {...props}
    />
  );
});

export const TextField = Object.assign(TextFieldBase, { Input });
