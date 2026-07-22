import { describe, expect, it } from "vitest";
import axios, { AxiosError } from "axios";
import { getErrorMessage } from "./axios";

describe("getErrorMessage", () => {
  it("returns timeout message for aborted requests", () => {
    const error = new AxiosError("timeout", "ECONNABORTED");
    expect(getErrorMessage(error)).toBe(
      "Request timed out. Please check your connection and try again."
    );
  });

  it("returns network message when no response", () => {
    const error = new AxiosError("Network Error");
    expect(getErrorMessage(error)).toBe(
      "Unable to reach the server. Please check your internet connection."
    );
  });

  it("returns API message from response body", () => {
    const error = new AxiosError("Bad Request", undefined, undefined, undefined, {
      status: 400,
      statusText: "Bad Request",
      data: { message: "Email already exists" },
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
    });
    expect(getErrorMessage(error)).toBe("Email already exists");
  });

  it("returns generic message for standard errors", () => {
    expect(getErrorMessage(new Error("Something broke"))).toBe("Something broke");
    expect(getErrorMessage("unknown")).toBe("Something went wrong");
  });
});
