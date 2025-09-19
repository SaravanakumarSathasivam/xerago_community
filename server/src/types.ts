export interface ApiError extends Error {
	status?: number;
}

export function createError(status: number, message: string): ApiError {
	const err = new Error(message) as ApiError;
	err.status = status;
	return err;
}


