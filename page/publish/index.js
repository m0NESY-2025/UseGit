/**
 * 目标1：设置频道下拉菜单
 *  1.1 获取频道列表数据
 *  1.2 展示到下拉菜单中
 */
async function setChannelList(){
    const res=await axios({
        url:'/v1_0/channels'
    })
    const options=`<option value="" selected="">全部</option>`+res.data.channels.map(item=>`<option value="${item.id}">${item.name}</option>`).join('')
    document.querySelector('.form-select').innerHTML=options

}
setChannelList()
/**
 * 目标2：文章封面设置
 *  2.1 准备标签结构和样式
 *  2.2 选择文件并保存在 FormData
 *  2.3 单独上传图片并得到图片 URL 网址
 *  2.4 回显并切换 img 标签展示（隐藏 + 号上传标签）
 */

document.querySelector('.img-file').addEventListener('change',async e=>{
    const file=e.target.files[0]
    if(!file)return
    const fd=new FormData()
    fd.append('image',file)
    const res=await axios({
        url:'/v1_0/upload',
        method:'POST',
        data:fd
    })
    document.querySelector('.rounded').src=res.data.url
    document.querySelector('.rounded').classList.add('show')
    document.querySelector('.place').classList.add('hide')
})
//点击图片可以重新切换封面
document.querySelector('.rounded').addEventListener('click',()=>{
    document.querySelector('.img-file').click()
})

/**
 * 目标3：发布文章保存
 *  3.1 基于 form-serialize 插件收集表单数据对象
 *  3.2 基于 axios 提交到服务器保存
 *  3.3 调用 Alert 警告框反馈结果给用户
 *  3.4 重置表单并跳转到列表页
 */
document.querySelector('.send').addEventListener('click',async e=>{
    if(e.target.innerHTML==='发布') {
    const form=document.querySelector('.art-form')
    const data=serialize(form,{hash:true,empty:true})
    //不需要id
    delete data.id
    data.cover={
        type:1, //封面类型 默认为1
        images:[document.querySelector('.rounded').src]  //封面图片的地址 要数组形式
    }
    try{await axios({
        url:'/v1_0/mp/articles',
        method:'POST',
        data,
    })//这里必须要将myAlert放在下面 或者在括号后面加分号 否则JavaScript解释器将两者误解为一体
    myAlert(true,'发布成功')
    //重置表单
    form.reset()
    document.querySelector('.rounded').src=''
    document.querySelector('.rounded').classList.remove('show')
    document.querySelector('.place').classList.remove('hide')
    editor.setHtml('')
    setTimeout(() => {
        location.href='../content/index.html'
    }, 800);
    }catch(error){
        myAlert(false,error.response.data.message)
    }
}

/**
 * 目标5：编辑-保存文章
 *  5.1 判断按钮文字，区分业务（因为共用一套表单）
 *  5.2 调用编辑文章接口，保存信息到服务器
 *  5.3 基于 Alert 反馈结果消息给用户
 */
    if(e.target.innerHTML==='修改'){
        const form=document.querySelector('.art-form')
        const data=serialize(form,{hash:true,empty:true})
        try{
        await axios({
        url:`/v1_0/mp/articles/${data.id}`,
        method:'PUT',
        data:{
            ...data,
            cover:{
                type:document.querySelector('.rounded'.src)? 1 : 0, //封面类型 默认为1
                    images:[document.querySelector('.rounded').src]  //封面图片的地址 要数组形式
                }
            }
        })
        myAlert(true,'修改成功')
        setTimeout(() => {
            location.href='../content/index.html'
        }, 800);
        
        }catch(error){
        myAlert(false,'修改失败')
        }
       
    }
})

/**
 * 目标4：编辑-回显文章
 *  4.1 页面跳转传参（URL 查询参数方式）
 *  4.2 发布文章页面接收参数判断（共用同一套表单）
 *  4.3 修改标题和按钮文字
 *  4.4 获取文章详情数据并回显表单
 */

//   自调用函数
;(async function(){
    const paramsStr=location.search
    const params=new URLSearchParams(paramsStr)
    const id=params.get('id')
    if(id){
    document.querySelector('.title span').innerHTML='修改文章'
    document.querySelector('.send').innerHTML='修改'
    const res=await axios({
        url:`/v1_0/mp/articles/${id}`
    })
    
    // 组织我仅仅需要的数据对象，为后续遍历回显到页面上做铺垫
    const dataObj={
        channel_id:res.data.channel_id,
        title:res.data.title,
        rounded:res.data.cover.images[0],
        content:res.data.content,
        id:res.data.id
    }
    //遍历数据对象属性
    Object.keys(dataObj).forEach(key=>{
        if(key==='rounded'){
            //封面设置
            if(dataObj[key]){
              document.querySelector('.rounded').src=dataObj[key]
              document.querySelector('.rounded').classList.add('show')
              document.querySelector('.place').classList.add('hide')
            }
        }else if(key==='content'){
            if(dataObj[key]){
               editor.setHtml(dataObj[key])
            }
        }else{
            //用数据对象属性名，作为标签name属性选择器值来找到匹配的标签
            document.querySelector(`[name=${key}]`).value=dataObj[key]
        }
    })
    }
})()


