import moment from "moment";
require("moment-duration-format");

export const formatSeconds = (t) => moment.duration(t, 'seconds').format("mm:ss");