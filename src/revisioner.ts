import * as Vinyl from 'vinyl';
import * as Path from 'path';
import { Tool } from './tool';

export class Revisioner {
    private files: any;
    private filesTemp: any;
    private hashCombined: any;
    private tool: any;
    private pathBase: string;
    private pathCwd: string;
    constructor () {
        // File pool, any file passed into the Revisioner is stored in this object
        this.files = {};
        this.filesTemp = [];
    
        // Stores the combined hash of all processed files, used to create the version file
        this.hashCombined = "";
    
        const nonFileNameChar = "[^a-zA-Z0-9\\.\\-\\_\\/]";
        const qoutes = "'|\"";
        const tool = new Tool();
    }
    public versionFile () {
        const manifestName = 'manifest.ts';
        const out = {
            style: {
                path: this.pathBase,
                hash: this.hashCombined
            }
        }
        let file = new Vinyl({
            cwd: this.pathCwd,
            base: this.pathBase,
            path: Path.join(this.pathBase, manifestName),
            contents: Buffer.from(JSON.stringify(out, null, 2)),
            revisioner: this
        });

        file.revisioner = this;
        return file;
    }
    public processFile (file) {
        if (!this.pathCwd) {
            this.pathCwd = file.cwd;
        }
    
        // Chnage relative paths to absolute
        if (!file.base.match(/^(\/|[a-z]:)/i)) {
            file.base = this.tool.join_path(file.cwd, file.base);
        }
    
        // Normalize the base common to all the files
        if (!this.pathBase) {
            this.pathBase = file.base;
        } else if (file.base.indexOf(this.pathBase) === -1) {
            const levelsBase: any[] = this.pathBase.split(/[/|\\]/);
            const levelsFile:[] = file.base.split(/[/|\\]/);
        
            let common: any[] = [];
            for (var level = 0, length = levelsFile.length; level < length; level++) {
                if (
                level < levelsBase.length &&
                level < levelsFile.length &&
                levelsBase[level] === levelsFile[level]
                ) {
                common.push(levelsFile[level]);
                continue;
                }
            }
        
            if (common[common.length - 1] !== "") {
                common.push("");
            }
            this.pathBase = common.join("/");
        }
    
        // Set original values before any processing occurs
        file.revHashOriginal = this.tool.md5(file.contents);
    
        this.filesTemp.push(file);
    }
    public run () {
        this.hashCombined = "";

        // Go through and correct the base path now that we have proccessed all the files coming in
        for (var i = 0, length = this.filesTemp.length; i < length; i++) {
        this.filesTemp[i].base = this.pathBase;
        var path = this.tool.get_relative_path(
            this.pathBase,
            this.filesTemp[i].path
        );
        this.files[path] = this.filesTemp[i];
        }

        // Resolve and set revisioned filename based on hash + reference hashes and ignore rules
        for (path in this.files) {
        this.hashCombined += this.files[path].revHashOriginal;
        }

        // Consolidate the concatinated hash of all the files, into a single hash for the version file
        this.hashCombined = this.tool.md5(this.hashCombined);
    }
}