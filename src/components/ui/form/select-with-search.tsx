"use client";
import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "../utils";
interface SelectWithSearchProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}
interface SelectWithSearchContentProps {
  className?: string;
  children: React.ReactNode;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
}
interface SelectWithSearchItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}
export function SelectWithSearch({
  value,
  onValueChange,
  placeholder,
  disabled,
  className,
  children,
}: SelectWithSearchProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [filteredChildren, setFilteredChildren] = React.useState(children);
  React.useEffect(() => {
    if (!searchValue) {
      setFilteredChildren(children);
      return;
    }
    const filtered = React.Children.toArray(children).filter((child) => {
      if (React.isValidElement(child) && child.props.children) {
        const text = child.props.children.toString().toLowerCase();
        return text.includes(searchValue.toLowerCase());
      }
      return true;
    });
    setFilteredChildren(filtered);
  }, [searchValue, children]);
  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
    setIsOpen(false);
    setSearchValue("");
  };
  const selectedItem = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.props.value === value
  );
  const displayValue = React.isValidElement(selectedItem) 
    ? selectedItem.props.children 
    : placeholder;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <span className={cn(!value && "text-muted-foreground")}>
          {displayValue}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-md border bg-white shadow-lg">
            {/* Search Input */}
            <div className="sticky top-0 border-b bg-white p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>
            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {React.Children.count(filteredChildren) > 0 ? (
                React.Children.map(filteredChildren, (child) => {
                  if (React.isValidElement(child)) {
                    const isSelected = child.props.value === value;
                    return React.cloneElement(child, {
                      ...child.props,
                      className: cn(
                        child.props.className,
                        isSelected && "text-[#257180]"
                      ),
                      onClick: () => handleValueChange(child.props.value),
                      children: (
                        <>
                          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                            <Check className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                          </span>
                          {child.props.children}
                        </>
                      )
                    });
                  }
                  return child;
                })
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Không tìm thấy kết quả
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export function SelectWithSearchContent({
  className,
  children,
}: SelectWithSearchContentProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
    </div>
  );
}
export function SelectWithSearchItem({
  value,
  children,
  className,
  onClick,
  ...props
}: SelectWithSearchItemProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-50 focus:bg-gray-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      data-value={value}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}