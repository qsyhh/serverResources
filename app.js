import fs from "fs";
import path from "path";
import { execSync } from 'child_process';

// 定义要排除的文件和文件夹
const excludeList = ['images', '1.sh', 'README.md', 'node_modules', '.git', '.gitignore', 'package.json', 'app.js', 'index.html'];

// 递归遍历目录并生成 HTML 结构
function generateFileTree(dir) {
    let html = '';
    const files = fs.readdirSync(dir);
    const fileCount = files.length;

    files.forEach((file, index) => {
        // 检查是否在排除列表中
        if (excludeList.includes(file)) {
            return;
        }

        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        const isLast = index === fileCount - 1;

        const prefix = '&nbsp;&nbsp;&nbsp;';
        const connector = isLast ? '└─ ' : '├─ ';
        // 获取最后修改时间
        const lastModified = stats.mtime.toLocaleString();

        if (stats.isDirectory()) {
            const svg = '<img src="/images/文件夹.svg">'
            const folderIndexPath = path.join(dir, file, 'index.html');
            html += `<div class="filename folder">${prefix}${connector}${svg}&nbsp;<a href="${folderIndexPath.replace(process.cwd() + '/serverResources', '')}">${file}</a><span class="lasttime">${lastModified}</span></div>`;
        } else {
            const svg = /.json$/.test(file) ? '<img src="/images/json.svg">' : '<img src="/images/未知.svg">'
            html += `<div class="filename file">${prefix}${connector}${svg}&nbsp;<a href="${filePath.replace(process.cwd() + '/serverResources', '')}">${file}</a><span class="lasttime">${lastModified}</span></div>`;
        }
    });

    return html;
}

// 生成完整的 HTML 文件内容
function generateHtmlPage(fileTree, dir) {
    let body = fileTree.replace(/&nbsp;(?!<a)/g, '')
    if (dir) {
        body = `<div class="back">└─<a href="${dir}/../index.html">&nbsp;返回上级</a></div>` + fileTree
    }
    return `
<!DOCTYPE html>
<html lang="zh-Hans">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${dir.replace('/', '') || '根目录'} 索引</title>
    <style>a {text-decoration: none;}a:link {color: #000;}a:visited {color: #000;}.filename {display: flex;margin: 10px 0px;align-items: center;line-height: 16px;} .lasttime {font-size: 10px;color: #bebebe;margin-left: auto;}</style>
</head>
<body>
    ${body}
</body>
</html>
    `;
}

// 递归生成每个目录的 index.html
function generateAllIndexFiles(dir) {
    const fileTree = generateFileTree(dir);
    const htmlPage = generateHtmlPage(fileTree, dir.replace(process.cwd() + '/serverResources', ''));
    const outputFilePath = path.join(dir, 'index.html');
    fs.writeFileSync(outputFilePath, htmlPage);

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory() &&!excludeList.includes(file)) {
            generateAllIndexFiles(filePath);
        }
    });
}

// 获取当前目录
const currentDir = process.cwd() + '/serverResources';

// 生成所有目录的 index.html
generateAllIndexFiles(currentDir);

console.log(`Directory tree has been written to index.html files in all directories.`);

