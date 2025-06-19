# 项目 9 嵌入式 Python 开发

## 项目描述

目前物联网、人工智能已经深入到医疗、家居、交通、教育和工业等多个领域，正在极大改变人们的日常生活。树莓派（Raspberry Pi）设计用于教育，目前已进化到第 4 代。树莓派不仅廉价而且周边设备多，互联网上有各种各样的接口设备、有趣的项目应用案例资料。诞生了大量的应用项目，作为可轻松开发程序的平台，知名度越来越高，受到物联网与人工智能项目开发人员的欢迎。在自己项目上采用采用 Raspberry Pi 时，"想使用特定的传感器"、"想与周边装置通信"、"想连接云服务"等，都能够快速的获得现存的解决方案，可以节约为实现这些功能所需要的巨大的开发成本。

传统的软件开发以瀑布模型的开发手法为主，如今要求缩短开发周期，要求开发新颖性高的软件，因此能够缩短开发周期的敏捷开发受到关注。敏捷开发是一种应对快速变化需求的一种软件开发模式，描述了一套软件开发的价值和原则。此模式中，自组织的跨功能团队在紧密的协作中发掘用户或顾客的需求以及改良解决方案，此模式也强调适度的项目、进化开发、提前交付与持续改进，并且鼓励快速与灵活的面对开发与变更。这些原则支持许多软件开发方法的定义和持续进化。即使采用这样的开发手法，树莓派的开发环境是 Linux，Python 是树莓派的官方编程语言，可简单获取各种开源项目案例，使得树莓派的开发项目从原型的验证到实际运行得以顺利推进。

## 项目目标

### 知识目标
1. 掌握树莓派开发板
2. 掌握 NVIDIA Jetson Nano 开发
3. 掌握 TensorFlow Lite、OpenCV

### 技能目标
1. 掌握配置树莓派 Python 环境
2. 掌握安装与配置 Jupyter lab
3. 掌握通用输入/输出接口（GPIO）
4. 掌握配置 NVIDIA Jetson Nano 开发环境
5. 掌握人脸识别的门禁系统
6. 掌握花卉识别

## 项目 9.1 配置树莓派开发环境

### 9.1.1 配置树莓派 Python 环境

Python 是一种功能强大的编程语言，易于使用，易于阅读和编写，Python 与树莓派结合可以将您的项目与现实世界轻松的联系起来。

树莓派默认已安装了 Python，打开终端窗口，执行 python 来测试是否安装了 Python开发环境，并查看当前的 Python 版本。

```bash
# python
Python 3.9.2 (default, Feb 28 2021, 17:03:44)
[GCC 10.2.1 20210110] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

Python2.7 官方已经停止维护了，树莓派目前安装的是 Python 3.9.2 版本。如果你的系统预装的 Python 版本不是 3.9.2，请将其升级。升级最简单的方法是直接更新树莓派系统，如果由于各种原因，不能升级树莓派系统，可以使用以下方法升级，这也适用于安装其它版本的 Python，只要下载时选择特定版本可以了。

1. 更新树莓派系统，整个系统升级到最新

```bash
# sudo apt-get update
# sudo apt-get upgrade
# sudo apt-get dist-upgrade
```

更新系统需要 root 权限，如果更新数据慢可以考虑跟换源，国内有很多源可以选择，例如阿里、清华等，其中清华源如图 9-1 所示。

图 9-1 清华 Raspbian 软件仓库镜像

使用 nano 或者 vi 编辑工具修改软件源的配置文件/etc/apt/sources.list。

2. 安装依赖

安装 python3.9.2 需要的依赖。有些软件已经存在，会自动忽略。

```bash
# sudo apt-get install build-essential libncurses-dev libreadline-dev libsqlite3-dev libssl-dev libexpat1-dev zlib1g-dev libffi-dev
…
建议安装：
ncurses-doc readline-doc sqlite3-doc libssl-doc
下列【新】软件包将被安装：
libffi-dev libncurses-dev libreadline-dev libsqlite3-dev libssl-dev
升级了 0 个软件包，新安装了 5 个软件包，要卸载 0 个软件包，有 1 个软件包未被升级。
…
```

3. 下载解压 Python 源码包

从 Python 官网下载 3.9.2 版源码，并把源码解压到当前目录下。

```bash
# cd ~
# wget https://www.python.org/ftp/python/3.9.2/Python-3.9.2.tgz
# tar zxvf Python-3.9.2.tgz
```

4. 配置、编译、安装

如果顺利的话整个编译过程需要 1 个小时，编译后源码的目录会增加到 130 MB。可以选择把新版 Python 安装到/opt/python3.9 目录下，或者安装在/usr/bin/python3.9 目录下。

```bash
# cd ./Python-3.9.2
# ./configure --prefix=/opt/python3.9
# make
# make
# sudo make install
```

在 make 命令后如果提示 Python 模块无法编译，需要按照错误提示排查原因，通常是没安装相应的依赖包。

5. 创建软链接

make install 成功运行后，Python 相关程序模块会拷贝到/opt/python3.9。在创建链接后就可以启动 Python 3.9.2 了。

创建/usr/bin/python 软链接指向 python 3.9，并创建一个 pip 的软链接。pip3 已经被官方集成到 Python 3.9 里，它用于安装第三方模块。

```bash
# sudo ln -s /opt/python3.9/bin/python3.9 /usr/bin/python
# sudo ln -s /opt/python3.9/bin/pip3 /usr/bin/pip3
```

### 9.1.2 安装与配置 Jupyter lab

提起 Jupyter Notebook，很多学习过 Python 的同学都不陌生。Jupyter 优点很多，例如功能强大，交互式、富文本，还有丰富的插件、主题修改、多语言支持等等。

JupyterLab 是 Jupyter Notebook 的全面升级。JupyterLab 是一个集 Jupyter Notebook、文本编辑器、终端以及各种个性化组件于一体的全能 IDE，下面介绍如何安装与配置 Jupyter lab。

1. 安装 Jupyter lab

通过 pip 安装 Jupyter lab，如果网络环境较差导致下载软件包慢，可以考虑更换源。

```bash
# pip3 install jupyterlab -i https://pypi.tuna.tsinghua.edu.cn/simple
```

jupyterlab-3.6.2 文件大小是 9.9 MB，安装成功后就可以进行下一步配置了。

如果安装出现提示 "ERROR: THESE PACKAGES DO NOT MATCH THE HASHES FROM THE REQUIREMENTS FILE." 则可在 pip install 添加 --no-cache-dir 参数，如果问题依旧，可手动下载安装需要的 Package 后用 pip 安装。

2. 配置文件

安装好以后，就是配置环节了，首先需要创建配置文件。

```bash
# jupyter notebook --generate-config
Writing default config to: /home/pzy/.jupyter/jupyter_notebook_config.py
```

配置文件不需要自己在某个文件夹下创建，是由 jupyter 软件生成的。运行成功后配置文件是/home/pi/.jupyter/jupyter_notebook_config.py。如果没有该文件则需要检查是否输入正确或重新安装一下 jupyterlab。

使用 vi 修改配置文件，配置文件路径，请使用修改为对应的路径。

```bash
# vi/home/pzy/.jupyter/jupyter_notebook_config.py
```

```python
## notebook 服务会监听的 IP 地址。
c.NotebookApp.ip = '*'
## 用于 notebooks 和内核的目录。
c.NotebookApp.notebook_dir = '/home/pzy'
## The port the notebook server will listen on (env: JUPYTER_PORT).
c.NotebookApp.port = 8888
## Whether to open in a browser after starting.
c.NotebookApp.open_browser = False
```

配置文件内容比较多，需要修改运行服务监听的 IP 地址，端口，用于 notebooks 内核的目录，是否打开浏览器。

然后设置 Jupyter lab 的访问密码，这一步并不是必须做的，访问密码为空也是正常的，但是建议使用。

```bash
# jupyter notebook password
```

输入密码，输入后回车即可。在输入密码的状态下，键盘按下字符是没有任何显示的，继续输入最后回车即可。如果配置文件中有错误，这时会提示，请注意提示信息。

重启树莓派后就可以尝试启动 Jupyter lab。

```bash
# jupyter lab
…
[I 19:08:53.896 ServerApp] notebooks 运行所在的本地路径: /home/pzy
[I 19:08:53.898 ServerApp] Jupyter Server 2.5.0 is running at:
[I 19:08:53.900 ServerApp] http://localhost:8888/lab
[I 19:08:53.902 ServerApp] http://127.0.0.1:8888/lab
[I 19:08:53.904 ServerApp] 使用 Control-C 停止此服务器并关闭所有内核（连续操作两次便可跳过确认界面）。
[I 19:10:29.431 LabApp] 302 GET /lab (@192.169.3.130) 54.90ms
[I 19:10:34.120 ServerApp] Generating new user for token-authenticated request: 16381b3386174456af66f876af1575f8
[I 19:10:34.121 ServerApp] User 16381b3386174456af66f876af1575f8 logged in.
[I 19:10:34.124 ServerApp] 302 POST /login?next=%2Flab (16381b3386174456af66f876af1575f8@192.169.3.130) 570.49ms
```

最后在树莓派浏览器中输入 http://127.0.0.1:8888 就可以正常运行了，如图 9-2 所示。Jupyter lab 支持远程访问，如果树莓派 ip 地址为 192.169.3.159，则输入 http://192.169.3.159:8888/lab。 