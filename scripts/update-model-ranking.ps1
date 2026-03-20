$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
function Classify-Arena([string]$name,[string]$org){
  $text=($name+' '+$org).ToLower()
  $open=@('apache','mit','llama','qwen','gemma','mistral','deepseek','yi','nemotron','phi','granite','arcee')
  $closed=@('proprietary','anthropic','openai','xai','grok','gemini','cohere','claude')
  if(($closed | Where-Object { $text -like "*$_*" }).Count -gt 0){
    if(($open | Where-Object { $text -like "*$_*" }).Count -gt 0){ return 'open' }
    return 'closed'
  }
  if(($open | Where-Object { $text -like "*$_*" }).Count -gt 0){ return 'open' }
  return 'closed'
}
function Get-LMArenaItems {
  $html=(Invoke-WebRequest -UseBasicParsing -Headers @{ 'User-Agent'='Mozilla/5.0' } -Uri 'https://lmarena.ai/leaderboard/text').Content
  $rows=[regex]::Matches($html,'(?s)<tr class="[^"]*">(.*?)</tr>')
  $items=@()
  foreach($m in $rows){
    $row=$m.Groups[1].Value
    $rank=[regex]::Match($row,'font-medium">(\d+)</span>').Groups[1].Value
    $model=[regex]::Match($row,'title="([^"]+)"').Groups[1].Value
    if(-not $model){ $model=[regex]::Match($row,'truncate">([^<]+)</span>').Groups[1].Value }
    $org=[regex]::Match($row,'text-text-secondary[^>]*>([^<]+)</span>').Groups[1].Value
    $score=[regex]::Match($row,'pl-5"><div[^>]*><span class="text-sm">([\d,]+)').Groups[1].Value
    $url=[regex]::Match($row,'<a target="_blank" rel="noopener noreferrer" href="([^"]+)"').Groups[1].Value
    if($rank -and $model -and $score){
      $items += [pscustomobject]@{
        rank=[int]$rank
        model=$model
        org=$org
        score=[int](($score -replace ',',''))
        url=$url
        availability=(Classify-Arena $model $org)
      }
    }
  }
  return $items | Sort-Object rank | Select-Object -First 18
}
function Get-HFItems {
  $tries=0
  while($true){
    $tries++
    try {
      $json=(Invoke-RestMethod -Headers @{ 'User-Agent'='Mozilla/5.0' } -Uri 'https://open-llm-leaderboard-open-llm-leaderboard.hf.space/api/leaderboard/formatted')
      $items=@()
      foreach($item in $json){
        if(-not $item.model.name){ continue }
        $items += [pscustomobject]@{
          model=$item.model.name
          score=[math]::Round([double]$item.model.average_score,2)
          license=$item.metadata.hub_license
          url=('https://huggingface.co/' + $item.model.name)
        }
      }
      return $items | Sort-Object score -Descending | Select-Object -First 18
    } catch {
      if($tries -ge 4){ throw }
      Start-Sleep -Seconds 2
    }
  }
}
$lm=Get-LMArenaItems
$hf=Get-HFItems
$generatedAt=(Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
$items=@()
foreach($item in $lm){
  $license=''
  if(-not [string]::IsNullOrWhiteSpace($item.org)){
    $license=($item.org -replace '^.*·\s*','')
  }
  $items += [pscustomobject]@{
    id=('lmarena-' + $item.rank)
    source='lmarena'
    sourceName='LMArena 综合榜'
    sourceNameEn='LMArena Overall'
    sourceUrl='https://lmarena.ai/leaderboard/text'
    rank=$item.rank
    model=$item.model
    organization=$item.org
    score=$item.score
    scoreLabel='Arena Score'
    scoreLabelEn='Arena Score'
    availability=$item.availability
    availabilityLabel=($(if($item.availability -eq 'open'){ '开源' } else { '闭源' }))
    availabilityLabelEn=($(if($item.availability -eq 'open'){ 'Open' } else { 'Closed' }))
    license=$license
    modelUrl=$item.url
    note='LMArena text leaderboard'
  }
}
$i=1
foreach($item in $hf){
  $items += [pscustomobject]@{
    id=('open-llm-' + $i)
    source='open-llm'
    sourceName='Hugging Face 开源榜'
    sourceNameEn='Hugging Face Open LLM Leaderboard'
    sourceUrl='https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard'
    rank=$i
    model=$item.model
    organization='Open LLM Leaderboard'
    score=$item.score
    scoreLabel='Average Score'
    scoreLabelEn='Average Score'
    availability='open'
    availabilityLabel='开源'
    availabilityLabelEn='Open'
    license=$item.license
    modelUrl=$item.url
    note='HF open leaderboard'
  }
  $i++
}
$payload=[pscustomobject]@{
  generatedAt=$generatedAt
  updatedText=(Get-Date).ToString('yyyy-MM-dd HH:mm')
  sources=[pscustomobject]@{
    lmarena=[pscustomobject]@{ id='lmarena'; name='LMArena 综合榜'; nameEn='LMArena Overall'; url='https://lmarena.ai/leaderboard/text'; updatedAt=$generatedAt; count=$lm.Count }
    openLlm=[pscustomobject]@{ id='open-llm'; name='Hugging Face 开源榜'; nameEn='Hugging Face Open LLM Leaderboard'; url='https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard'; updatedAt=$generatedAt; count=$hf.Count }
  }
  items=$items
}
$payload | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 F:\codex\.codex-temp\model-ranking-data.json
Write-Host "wrote $($items.Count) items"
