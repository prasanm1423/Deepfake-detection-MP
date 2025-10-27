import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';
import { AnalysisResult } from '@shared/api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DetailedModelBreakdownProps {
  result: AnalysisResult;
}

export function DetailedModelBreakdown({ result }: DetailedModelBreakdownProps) {
  if (!result.modelBreakdown) {
    return null;
  }

  const { modelBreakdown, confidence, isDeepfake } = result;

  // Format percentage
  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

  // Determine verdict and color
  const verdictText = isDeepfake
    ? 'Likely Deepfake'
    : 'Not likely to be AI-generated or Deepfake';
  
  const verdictColor = isDeepfake
    ? 'bg-red-600 dark:bg-red-700'
    : 'bg-green-600 dark:bg-green-700';

  const verdictPercentage = Math.round(confidence * 100);

  // Model category component
  const ModelCategory = ({ 
    title, 
    items, 
    tooltip 
  }: { 
    title: string;
    items: { label: string; value: number }[];
    tooltip?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground capitalize">{item.label}</span>
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <Progress 
                value={item.value * 100} 
                className="h-2"
                indicatorClassName={item.value > 0.7 ? 'bg-red-500' : item.value > 0.3 ? 'bg-yellow-500' : 'bg-gray-300'}
              />
              <span className="text-sm font-medium text-foreground min-w-[3rem] text-right">
                {formatPercent(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="glass-effect border-2 border-border/50 animate-in slide-in-from-bottom-4 duration-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground">
            {verdictText}
          </CardTitle>
          <Badge className={`${verdictColor} text-white text-2xl font-bold px-6 py-2`}>
            {verdictPercentage}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Level Indicators */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">GenAI</span>
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <Progress 
                value={modelBreakdown.genAI * 100} 
                className="h-2.5"
                indicatorClassName="bg-gray-400"
              />
              <span className="text-sm font-semibold text-foreground min-w-[3rem] text-right">
                {formatPercent(modelBreakdown.genAI)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">Face manipulation</span>
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <Progress 
                value={modelBreakdown.faceManipulation * 100} 
                className="h-2.5"
                indicatorClassName={modelBreakdown.faceManipulation > 0.7 ? 'bg-red-500' : 'bg-gray-300'}
              />
              <span className="text-sm font-semibold text-foreground min-w-[3rem] text-right">
                {formatPercent(modelBreakdown.faceManipulation)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Diffusion Models */}
          <ModelCategory
            title="Diffusion"
            tooltip="AI models that generate images through iterative denoising processes (Stable Diffusion, DALL-E, etc.)"
            items={[
              { label: 'Other', value: modelBreakdown.diffusion.other },
              { label: 'Wan', value: modelBreakdown.diffusion.wan },
              { label: 'Stable Diffusion', value: modelBreakdown.diffusion.stableDiffusion },
              { label: 'Reve', value: modelBreakdown.diffusion.reve },
              { label: 'Recraft', value: modelBreakdown.diffusion.recraft },
              { label: 'Qwen', value: modelBreakdown.diffusion.qwen },
              { label: 'MidJourney', value: modelBreakdown.diffusion.midjourney },
              { label: 'Imagen', value: modelBreakdown.diffusion.imagen },
              { label: 'Ideogram', value: modelBreakdown.diffusion.ideogram },
              { label: 'GPT-4o', value: modelBreakdown.diffusion.gpt4o },
              { label: 'Flux', value: modelBreakdown.diffusion.flux },
              { label: 'Firefly', value: modelBreakdown.diffusion.firefly },
              { label: 'Dall-E', value: modelBreakdown.diffusion.dalle },
            ]}
          />

          {/* GAN Models */}
          <div className="space-y-6">
            <ModelCategory
              title="GAN"
              tooltip="Generative Adversarial Networks - older AI image generation technology"
              items={[
                { label: 'StyleGAN', value: modelBreakdown.gan.styleGAN },
              ]}
            />

            {/* Other Techniques */}
            <ModelCategory
              title="Other"
              tooltip="Face swapping and manipulation techniques used in deepfakes"
              items={[
                { label: 'Face manipulation', value: modelBreakdown.other.faceManipulation },
              ]}
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            This breakdown shows the probability that different AI models or techniques were used
            to create or manipulate this content. Higher percentages indicate stronger detection signals.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

