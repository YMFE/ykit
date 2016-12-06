#!/bin/bash -e
export RELEASE=1

update_version() {
  echo "$(node -p "p=require('./${1}');p.version='${2}';JSON.stringify(p,null,2)")" > $1
  echo "将 ${1} 的版本号升级到 ${2}"
}

validate_semver() {
  if ! [[ $1 =~ ^[0-9]\.[0-9]+\.[0-9](-.+)? ]]; then
    echo >&2 "版本号 $1 不合法！正确的版本号格式应该形如 1.0.2 或 2.3.0-beta.1"
    exit 1
  fi
}

unpublish_current_version() {
  npm unpublish $1@$2 --registry=http://registry.npm.corp.qunar.com/
}

current_version=$(node -p "require('./package').version")
package_name=$(node -p "require('./package').name")

printf "输入下一个版本号(当前版本是 $current_version, 直接回车为当前版本号): "
read next_version

if [ "$next_version" = "" ]; then
  next_version="$current_version"
else
  validate_semver $next_version
fi

# 表明可能需要发 rc-tag
if [[ "$next_version" =~ ^[0-9]\.[0-9]+\.[0-9]-.+ ]]; then
  printf "请输入 npm 需要发布的 tag (如 rc tag, 与正常 install 版本相区分): "
  read tag_name
fi

next_ref="v$next_version"

# npm test

update_version 'package.json' $next_version

if [ "$next_version" = "$current_version" ]; then
  unpublish_current_version $package_name $current_version
  git tag -d $next_ref || echo "本地不存在 $next_ref tag"
  git push origin -d tag $next_ref || echo "线上不存在 $next_ref tag"
else
  git commit -am "Version $next_version"
fi

# push first to make sure we're up-to-date
git push origin master

git tag $next_ref

git push origin $next_ref

if [ "$tag_name" = "" ]; then
  npm publish --registry=http://registry.npm.corp.qunar.com/
else
  npm publish --registry=http://registry.npm.corp.qunar.com/ --tag $tag_name
fi  
