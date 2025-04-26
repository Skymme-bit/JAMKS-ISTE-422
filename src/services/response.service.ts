const responseWrapper = (status: string, event_type: string, body: any) => {
  // Returning the result of the function
  return { status: status, event: event_type, body };
};

export default responseWrapper;
