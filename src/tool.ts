import * as Path from 'path';
import * as crypto from 'crypto';

export class Tool {
    constructor () {
    }
    public join_path (directory, filename) {
        return Path.join(directory, filename)
      .replace(/^[a-z]:\\/i, "/")
      .replace(/\\/g, "/");
    }
    public get_relative_path (base, path, noStartingSlash) {
        if (base === path) {
            return "";
        }
      
        // Sanitize inputs, convert windows to posix style slashes, ensure trailing slash for base
        base =
        base
            .replace(/^[a-z]:/i, "")
            .replace(/\\/g, "/")
            .replace(/\/$/g, "") + "/";
        path = path.replace(/^[a-z]:/i, "").replace(/\\/g, "/");
    
        // Only truncate paths that overap with the base
        if (base === path.substr(0, base.length)) {
        path = "/" + path.substr(base.length);
        }
    
        var modifyStartingSlash = noStartingSlash !== undefined;
        if (modifyStartingSlash) {
        if (path[0] === "/" && noStartingSlash) {
            path = path.substr(1);
        } else if (path[0] !== "/" && !noStartingSlash) {
            path = "/" + path;
        }
        }
    
        return path;
    }
    public md5 (buf) {
        return crypto
            .createHash("md5")
            .update(buf)
            .digest("hex");
    }
}

