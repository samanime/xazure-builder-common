import { basename } from "path";

const jsMatcherPattern = /\.js$/;

export const makeMatcher = (...patterns) =>
  Object.assign(path => patterns.every(pattern => pattern.test(path)), { patterns });

export const publicJsMatcher = makeMatcher(jsMatcherPattern);

export const privateJsMatcher = makeMatcher(jsMatcherPattern, /^(?!src\/public)/);

export const cssMatcher = makeMatcher(/\.css$/);

export const copyMatcher = path => makeMatcher(/^[^.]+$|\.(?!(js|css)$)([^.]+$)/)(path) && !/^\./.test(basename(path));