import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useQuery } from "@tanstack/react-query"
import api from "../../utils/api"

const MultiSelect = React.forwardRef(({ className, value = [], onChange, placeholder }, ref) => {
  const [open, setOpen] = React.useState(false)

  const { data: mealTypes = [], isError } = useQuery({
    queryKey: ['meal-types'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/meals');
        return Array.isArray(response.data) ? response.data.map(meal => ({
          value: meal.id.toString(),
          label: meal.name
        })) : [];
      } catch (error) {
        console.error('Error fetching meal types:', error);
        return [];
      }
    }
  });

  const options = React.useMemo(() => 
    Array.isArray(mealTypes) ? mealTypes : [], 
    [mealTypes]
  );

  const selectedLabels = React.useMemo(() => {
    if (!Array.isArray(value) || !Array.isArray(options)) return '';
    return options
      .filter((option) => value.includes(option.value))
      .map((option) => option.label)
      .join(", ");
  }, [value, options]);

  const handleSelect = (currentValue) => {
    if (!Array.isArray(value)) {
      onChange([currentValue]);
      return;
    }
    const newValue = value.includes(currentValue)
      ? value.filter((v) => v !== currentValue)
      : [...value, currentValue];
    onChange(newValue);
  };

  if (isError) {
    return <div>Error loading meal types</div>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value?.length && "text-muted-foreground",
            className
          )}
        >
          {selectedLabels || placeholder || "Select options..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Pesquisar tipo de refeição..." />
          <CommandEmpty>Nenhum tipo de refeição encontrado.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    Array.isArray(value) && value.includes(option.value) ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
});

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };