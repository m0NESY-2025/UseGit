/**
 * 目标1：获取文章列表并展示
 *  1.1 准备查询参数对象
 *  1.2 获取文章列表数据
 *  1.3 展示到指定的标签结构中
 */
const queryObj={
    status:'', //0-草稿,1-待审核, 2-审核通过, 3-审核失败, 4-已删除, 不传则默认为2
    channel_id:'',//文章频道id 空字符串-全部
    page:1,  //当前页码
    per_page:'2' //当前页码条数
}
let totalCount=0 //保存文章总条数
let totalPage=0
async function serArticleList(){
    const res=await axios({
        url:'/v1_0/mp/articles',
        params:queryObj
    })
    const htmlStr=res.data.results.map(item=>`<tr>
    <td>
      <img src="${item.cover.type===0?`https://img2.baidu.com/it/u=2640406343,1419332367&amp;fm=253&amp;fmt=auto&amp;app=138&amp;f=JPEG?w=708&amp;h=500`:item.cover.images[0]}" alt="">
    </td>
    <td>${item.title}</td>
    <td>
      ${item.status===1?`<span class="badge text-bg-primary">待审核</span>`:`<span class="badge text-bg-success">审核通过</span>`}
    </td>
    <td>
      <span>${item.pubdate}</span>
    </td>
    <td>
      <span>${item.read_count}</span>
    </td>
    <td>
      <span>${item.comment_count}</span>
    </td>
    <td>
      <span>${item.like_count}</span>
    </td>
    <td data-id="${item.id}">
      <i class="bi bi-pencil-square edit"></i>
      <i class="bi bi-trash3 del"></i>
    </td>
    </tr>`).join('')
    document.querySelector('.art-list').innerHTML=htmlStr
    totalCount=res.data.total_count
    totalPage=Math.ceil(totalCount/queryObj.per_page)
    if(totalPage==0)totalPage=1
    document.querySelector('.total-count').innerHTML=`共${totalPage}页`
}
serArticleList()
/**
 * 目标2：筛选文章列表
 *  2.1 设置频道列表数据
 *  2.2 监听筛选条件改变，保存查询信息到查询参数对象
 *  2.3 点击筛选时，传递查询参数对象到服务器
 *  2.4 获取匹配数据，覆盖到页面展示
 */
async function setChannelList(){
    const res=await axios({
        url:'/v1_0/channels'
    })
    const options=`<option value="" selected="">全部</option>`+res.data.channels.map(item=>`<option value="${item.id}">${item.name}</option>`).join('')
    document.querySelector('.form-select').innerHTML=options

}
setChannelList()
//状态的
document.querySelectorAll('.form-check-input').forEach(radio=>{
    radio.addEventListener('change',e=>{
        queryObj.status=e.target.value
    })
})
//频道的
document.querySelector('.form-select').addEventListener('change',e=>{
    queryObj.channel_id=e.target.value
})
document.querySelector('.sel-btn').addEventListener('click',()=>{
    serArticleList()
})
/**
 * 目标3：分页功能
 *  3.1 保存并设置文章总条数
 *  3.2 点击下一页，做临界值判断，并切换页码参数并请求最新数据
 *  3.3 点击上一页，做临界值判断，并切换页码参数并请求最新数据
 */
document.querySelector('.next').addEventListener('click',()=>{
    if(queryObj.page<(totalCount/queryObj.per_page))
    queryObj.page++
    document.querySelector('.page-now').innerHTML=`第${queryObj.page}页`
    serArticleList()
})
document.querySelector('.last').addEventListener('click',()=>{
    if(queryObj.page>1)
    queryObj.page--
    document.querySelector('.page-now').innerHTML=`第${queryObj.page}页`
    serArticleList()
})
/**
 * 目标4：删除功能
 *  4.1 关联文章 id 到删除图标
 *  4.2 点击删除时，获取文章 id
 *  4.3 调用删除接口，传递文章 id 到服务器
 *  4.4 重新获取文章列表，并覆盖展示
 *  4.5 删除最后一页的最后一条，需要自动向前翻页
 */
// 接口:  /mp/v1_0/articles/{id}
let id=0
document.querySelector('.art-list').addEventListener('click', e=>{
     //* 目标4：删除功能
    if(e.target.classList.contains('del')){
    id=e.target.parentNode.dataset.id
      axios({
        url:`/v1_0/mp/articles/${id}`,
        method:'DELETE',
      }).then(()=>{
        myAlert(true,'删除成功')
        const children=document.querySelector('.art-list').children
        if(children.length==1&&queryObj.page!==1){
            queryObj.page--
            document.querySelector('.page-now').innerHTML=`第${queryObj.page}页`
        }
        serArticleList()
      }).catch(()=>{
        myAlert(false,'删除失败')
        serArticleList()
      })
    }
      // 编辑功能
      if(e.target.classList.contains('edit')){
        id=e.target.parentNode.dataset.id
        location.href=`../publish/index.html?id=${id}`
      }
})
// 点击编辑时，获取文章 id，跳转到发布文章页面传递文章 id 过去

